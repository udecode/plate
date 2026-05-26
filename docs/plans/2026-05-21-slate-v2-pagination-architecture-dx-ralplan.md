# Slate v2 Rich Markdown Pagination Architecture DX Ralplan

## Status

- Review status: complete.
- Execution status: raw Markdown/table package tracers hard-cut; lane still
  pending on layout substrate and pagination proof.
- Verdict: current pagination is a good experimental proof, not the cleanest
  final architecture/DX for full rich Markdown.
- Decision: keep the Premirror-shaped page surface/editor overlay, but promote
  Slate layout from block-string projection to run-aware and box-aware
  projection, then move line decoration, native hit-target policy, and table
  geometry out of examples into `slate-layout`.
- Scope expansion: target Markdown-standard rich text as product reality for
  proof, but keep Markdown syntax and table feature packages above raw Slate.
  Slate owns the substrate needed for tables, task lists, strikethrough,
  autolinks, code fences, inline code, links, images, block quotes, headings,
  lists, thematic breaks, and hard/soft line breaks.

## Source Evidence

- `.tmp/slate-v2/site/examples/ts/pagination.tsx` owns
  `buildPaginationProjection`, path-keyed element boxes, per-text-span line
  decorations, `hitWidth`, and `hitHeight`.
- `.tmp/slate-v2/packages/slate-layout/src/index.ts` owns
  `getSlatePageLayoutGeometry`, `getSlatePageLayoutProjection`, pagination
  fragments, root-aware `projectRange`, and layout snapshots.
- `.tmp/slate-v2/site/examples/ts/markdown-shortcuts.tsx` currently covers
  only small block-start shortcuts for headings, block quotes, and lists.
- `.tmp/slate-v2/site/examples/ts/tables.tsx` is explicitly a basic rendering
  example; table editing is local and minimal, with no table map, row/column
  commands, header/alignment model, selection grid, or pagination geometry.
- `.tmp/slate-v2/site/examples/ts/custom-types.d.ts` defines table, row, and
  cell example types, but these are site example types, not a Slate layout or
  Markdown schema contract.
- `.tmp/slate-v2/packages/slate-layout/src/react.tsx` keeps `PagedEditable`
  focused on fixed page surfaces plus one editable overlay.
- `.tmp/slate-v2/playwright/integration/examples/pagination.test.ts` proves
  blank-tail clicks, paragraph-gap clicks, leading empty paragraphs, caret
  containment, and Backspace behavior in Chromium.
- `../premirror/packages/react/src/index.tsx` has the right shape: page
  viewport, geometry, single editor overlay, projected selection.
- `../premirror/packages/core/src/index.ts` models `StyledRun`, `PlacedRun`, and
  per-line run ranges instead of reducing a block to one string/style pair.
- `../premirror/apps/demo/src/App.tsx` still keeps paragraph/run decoration
  construction in the demo. That is acceptable for a prototype but not the best
  Slate v2 API target.
- `../pretext/src/rich-inline.ts` exposes rich inline items, fragments, and line
  ranges. Slate should use that substrate for mixed leaf styles instead of
  measuring every block with the first text leaf.
- `docs/research/concepts/markdown-native-editing-authority.md` says Markdown
  editing authority is not just parser correctness; it includes paragraph
  creation, line-break handling, links/images, shorthand expansion, and keyboard
  ownership.
- `docs/research/sources/typora/code-math-table-and-task-surfaces.md` says code,
  math, table, and task surfaces own local editing behavior; tables need
  row/column insert/delete, resize, alignment, movement, and menu-level
  operations.
- `docs/research/sources/lexical/markdown-package-and-shortcuts-doc-patterns.md`
  supports grouping import/export, shortcuts, and transformers, but that package
  shape belongs in Plate for Slate's ecosystem boundary.
- `docs/research/sources/tiptap/input-rules-and-extension-doc-patterns.md`
  supports a dedicated input-rule concept with extension-local rule authoring.

## Intent Boundary

Intent: decide whether the current pagination/layout direction can become the
clean architecture for full Markdown-standard rich text, including tables.

Desired outcome: a Slate-close API where Plate/app-owned Markdown import/export,
input rules, rich inline layout, tables, and pagination compose without examples
owning private geometry or parser glue.

In scope:

- Pagination projection API shape.
- Generic schema/spec pressure from CommonMark plus GFM-style table/task/list
  surfaces.
- Substrate boundaries for import/export and input-rule ownership.
- Decoration generation for projected lines.
- Run-aware inline layout for marks, links, inline code, images/atoms, and
  custom inline chips.
- Box-aware block layout for code blocks, block quotes, lists, thematic breaks,
  images, and tables.
- Table model, table map, cell geometry, selection grid, and pagination
  behavior.
- Native click hit targets for blank paragraph tails and vertical paragraph
  gaps.
- React ownership between `PagedEditable`, `Editable`, and page chrome.
- Tests needed before promoting this beyond an experimental example.

Non-goals:

- Production fragmented editable DOM.
- Cross-page copy/paste guarantees.
- IME/mobile pagination claims.
- Plate product package implementation.
- Moving layout measurement into `slate-react`.
- Implementing Markdown or table product packages in raw Slate.
- Shipping a full Typora clone; Typora is authority evidence, not product scope.

Decision boundaries:

- `PagedEditable` should stay a thin page-stack renderer.
- `slate-layout` owns page geometry, projected block/line/table rectangles, and
  layout-space hit-target policy.
- Plate/app feature packages own parse/serialize/input-rule APIs; Slate core
  owns the document and operation substrate, not Markdown opinions.
- Plate/app table features own table navigation and table transforms; layout
  consumes structural facts through generic block/table geometry.
- The example owns toolbar state, debug chrome, and final visual styling.
- Native browser selection quirks need browser proof, but the policy should be
  testable as pure layout data first.

## Decision Brief

Principles:

- Keep Slate unopinionated.
- Treat CommonMark plus GFM-style tables/tasks as a first-class proof corpus,
  not raw Slate package scope.
- Put reusable geometry in layout, not in examples.
- Keep React props boring and composable.
- Make selection-sensitive math unit-testable before relying on browser tests.
- Preserve a clear adoption path from experimental example to internal API.

Drivers:

- The current example carries too much reusable logic.
- The current layout model carries one `text` string and one `textStyle` per
  block, while Slate documents are leaf/run based.
- Markdown tables are structural blocks, not inline text runs; a run-aware model
  alone is insufficient.
- Current table behavior is an example-local minimal guard. That is not good
  enough for a Markdown-rich document editor.
- `hitWidth` and `hitHeight` are real concepts, not demo styling.
- Rich text can make per-line/per-leaf mapping expensive if every line scans
  every leaf span in the block.
- The current `PagedEditable` split is good and should not absorb selection
  policy.
- Premirror validates the page-stack/editor-overlay model, but Slate can do
  better than copying demo-local decoration construction.

Options:

1. Keep everything in the example.
   - Reject. It is fine as a spike, but it teaches users to copy private
     projection glue and hit-target hacks.
2. Move hit testing into `PagedEditable`.
   - Reject. It makes the React wrapper opinionated and harder to compose with
     non-page rendering strategies.
3. Add a layout-owned projection/hit-target helper and a small decoration
   bridge without changing the block-string model.
   - Reject as incomplete. It cleans the example, but the underlying layout
     still lies for mixed inline styles.
4. Add run-aware layout projection, then expose a layout-owned hit-target helper
   and decoration bridge.
   - Reject as still incomplete for tables, code fences, images, and block
     boxes.
5. Add run-aware inline projection plus box-aware block/table projection, then
   let Plate/app feature packages expose Markdown and table APIs over that
   substrate.
   - Choose. This gives examples clean DX while keeping raw Slate unopinionated
     and aligned with rich Markdown pressure.

## Markdown Rich-Text Target

Target support is not "a few Markdown shortcuts". It is a rich document model
that round-trips Markdown syntax while editing as Slate nodes:

- blocks: paragraph, headings 1-6, block quote, thematic break, fenced code
  block, indented code block, ordered list, unordered list, list item, task list
  item, table, table row, table cell, image block when represented as block
  content
- inlines: emphasis, strong, strikethrough, inline code, link, autolink, image
  inline/atom when schema chooses inline image, hard break, escaped punctuation
- extension lane: GFM tables/tasks/strikethrough/autolink are explicit
  extensions over CommonMark core

Raw Slate should not expose a Markdown package. The Slate-level API should stay
layout/substrate-shaped:

```ts
const editor = createEditor({
  extensions: [
    pageLayout({ engine: pretextPageLayoutEngine() }),
  ],
})
```

Framework authors should build Markdown parse/serialize/input rules in Plate or
app packages over Slate's schema, transform, clipboard/input, and layout
primitives. Do not put Markdown behavior into `slate-layout`, `slate-react`, or
`PagedEditable`.

## Run-Aware Layout Target

The current model:

```ts
type SlatePageLayoutBlock = {
  text: string
  textStyle: SlatePageLayoutTextStyle
}
```

This is too weak for Slate. The replacement target is leaf/run based for inline
content, and block/table-box based for structured content:

```ts
type SlatePageLayoutRun = {
  id: string
  path: Path
  range: {
    end: number
    start: number
  }
  text: string
  textStyle: SlatePageLayoutTextStyle
}

type SlatePageLayoutBlock = {
  element: Element
  kind: 'flow' | 'box' | 'table'
  lineHeight: number
  path: Path
  runs: readonly SlatePageLayoutRun[]
  boxes?: readonly SlatePageLayoutBox[]
  spacingAfter: number
}
```

Box layout target:

```ts
type SlatePageLayoutBox = {
  kind: 'block' | 'code-line' | 'image' | 'thematic-break' | 'table' | 'table-cell'
  path: Path
  rect: SlatePageRect
  split?: 'avoid' | 'page' | 'row' | 'line'
}
```

Line output should preserve placed runs:

```ts
type SlatePageLayoutPlacedRun = SlatePageLayoutRun & {
  left: number
  width: number
}

type SlatePageLayoutProjectedLine = {
  blockIndex: number
  hitRect: SlatePageRect
  lineIndex: number
  pageIndex: number
  path: Path
  runs: readonly SlatePageLayoutPlacedRun[]
  textRect: SlatePageRect
}
```

This matches Premirror's `StyledRun`/`PlacedRun` split and maps directly to
Pretext rich-inline fragments. It also creates a place for tables and atomic
Markdown blocks that are not text-flow runs.

## Table Architecture Target

Tables need their own model. The current example renders nested Slate elements
and prevents some destructive actions at cell boundaries, but that is not a
Markdown-rich table architecture.

Owner boundary: table editing belongs in Plate/app feature packages. Raw Slate
should expose enough generic structure for those packages to provide header
rows, alignment, cell-grid selection, row splitting, and repeated headers
without importing a raw Slate table package.

Core data model:

```ts
type TableElement = {
  type: 'table'
  align?: Array<'left' | 'center' | 'right' | null>
  children: TableRowElement[]
}

type TableCellElement = {
  type: 'table-cell'
  header?: boolean
  colspan?: number
  rowspan?: number
  children: Descendant[]
}
```

Product-package responsibilities:

- table map: resolves rectangular grid, spans, missing-cell repairs, and row
  ownership
- cell selection: independent from text selection but mapped to Slate ranges
  for copy/delete commands
- commands: insert/delete row/column, move row/column, set alignment, toggle
  header, normalize table
- Markdown: GFM table parser/serializer owns delimiter rows and alignment
  markers; table feature package owns rich editing

Raw Slate substrate:

- schema/spec hooks for nested structured blocks
- transforms and normalization that do not corrupt table-like trees
- selection primitives that feature packages can map to cell selections
- layout box projection for app-provided row/cell facts
- pagination policy inputs for row boxes, cell boxes, oversized rows, and wide
  table overflow

Rejected shortcut: treating tables as paragraphs with pipes. That is fine for a
source editor, not a rich Markdown editor.

## Code Fence, List, Image, And Break Targets

- Code fences: code-block plus code-line children; Pretext/layout treats each
  code line as a stable measured line with monospace typography, horizontal
  overflow policy, and local Tab/Shift+Tab behavior.
- Lists: list containers own marker/indent geometry; list items own paragraph
  flow. Layout should expose marker boxes separately from text boxes.
- Task lists: checkbox is an atomic inline/block adornment with Markdown state
  stored in the list item, not a random rendered input.
- Images: image nodes are measured boxes with intrinsic dimensions, captions as
  optional child flow, and explicit inline-vs-block behavior.
- Hard breaks: represented as line-break layout facts, not extra paragraphs.
- Thematic breaks: atomic horizontal box with no text run.

## Ecosystem Strategy Synthesis

| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
| ------ | ------ | --------- | ------ | ----- | ------ | ------------ | ------- |
| Premirror | `../premirror/packages/core/src/index.ts`, `../premirror/packages/react/src/index.tsx` | snapshot -> measured runs -> composed pages -> single editor overlay | page chrome growing with content, duplicated text layer | run model, page geometry, single overlay, projected selection | ProseMirror position model as public API | Slate path/root based run and box projection | agree |
| Pretext | `../pretext/src/rich-inline.ts` | rich inline items produce fragment ranges and line stats | block-string measurement lying for mixed styles | rich-inline range walking and prepared measurement cache | editor ownership inside text layout engine | layout engine adapter consumes Slate runs and returns placed runs | agree |
| Typora | `docs/research/sources/typora/code-math-table-and-task-surfaces.md` | Markdown surfaces own local editing behavior | parser-only Markdown that feels fake while editing | table/task/code/math behavior as UX authority | full Typora product clone | Plate/app packages over Slate substrate | partial |
| Lexical | `docs/research/sources/lexical/markdown-package-and-shortcuts-doc-patterns.md` | Markdown package groups import/export, shortcuts, transformers | scattering Markdown features across examples | transformer inventory and explicit conversion layer | Lexical node/update model and raw-Slate Markdown package | Plate Markdown package over Slate substrate | diverge |
| Tiptap | `docs/research/sources/tiptap/input-rules-and-extension-doc-patterns.md` | dedicated input rules concept plus extension-local authoring | hidden editor-global autoformat magic | explicit input-rule API and extension hook | regex-heavy docs as first DX | Plate/app input-rule packages over Slate hooks | agree |
| Current Slate v2 | `.tmp/slate-v2/site/examples/ts/markdown-shortcuts.tsx`, `.tmp/slate-v2/site/examples/ts/tables.tsx` | example-local transforms and renderers | none; this is the current gap | keep examples as proof fixtures | shipping example-local logic as best practice | substrate-owned layout, feature-owned Markdown/table | gap |

## Architecture North Star

Layering:

1. `slate`: document model, operations, schema/specs, transactions, history,
   state fields, deterministic normalization.
2. `slate-layout`: page geometry, run projection, box projection, hit targets,
   range projection, and layout invalidation.
3. `slate-layout-pretext`: measurement engine adapter for inline rich text and
   line geometry.
4. `slate-react`: editable runtime, DOM bridge, browser selection, rendering
   strategy, and subscriptions.
5. examples: composition demos and local proof fixtures only.
6. Plate/app packages: Markdown parse/serialize/input rules, table maps,
   commands, cell-selection UX, GFM hooks, menus, shortcuts, and product docs.

Public DX should read like this:

```tsx
const editor = useSlateEditor({
  extensions: [
    pageLayout({ engine: pretextPageLayoutEngine() }),
  ],
  initialValue,
})

return (
  <Slate editor={editor}>
    <PagedEditable
      layout={layout}
      renderElement={renderElement}
      renderLeaf={renderLeaf}
    />
  </Slate>
)
```

No example should need to know how to map leaf spans to measured line
fragments, how to stretch native hit targets, or how table cells paginate.

## Performance Architecture

Runtime invalidation:

- document edits dirty block ids, affected table ids, and affected page ids
- Markdown input rules run inside the transaction that produced the typed
  trigger; no follow-up render effect
- paste/import builds a fragment first, fits it once, then commits one
  transaction
- layout caches prepared rich inline runs by text/style key and invalidates at
  run granularity
- table maps cache per table runtime id and recompute only for touched table
  structure
- projection stores separate visual rects from hit rects, so browser hit policy
  does not trigger measurement recomposition
- React components subscribe through external stores or memoized projection
  snapshots; no per-cell or per-line broad editor subscription

Budgets:

- normal typing in visible page: p95 under 16ms
- table cell navigation in visible table: p95 under 16ms
- 10k-block Markdown document: edit invalidates changed block plus dependent
  page range, not full document
- 1k-row table: structural command recomputes one table map, not all tables
- 1MB Markdown paste: one parser pass, one transaction, one layout refresh batch
- page projection memory: bounded by pages plus dirty cache, not DOM nodes for
  every invisible page

Degradation policy:

- oversized table row: keep row intact when possible, then use explicit
  oversized-row fallback with debug warning
- very wide GFM table: horizontal table scroll inside page content is allowed
  only as an explicit table policy, not accidental document scroll
- huge paste: schedule layout work behind transition/idle chunks after the
  model transaction commits

## Implementation Phases

1. Raw Markdown/table package hard cut:
   - status: complete
   - remove raw Slate Markdown/table package tracers
   - keep syntax/table behavior in Plate/app package scope
   - keep examples as local proof fixtures only
2. Run-aware layout:
   - status: first tracer complete
   - replace block `text/textStyle` with runs
   - adapt `slate-layout-pretext` to `prepareRichInline`
   - project placed runs back to exact Slate leaf paths
3. Box-aware layout:
   - status: first tracer complete
   - add atomic block, list marker, code line, image, thematic break, and table
     boxes
   - add row/cell projection and page split policies
4. Projection DX:
   - status: first tracer complete
   - add `getSlatePageLayoutDecorations`
   - add `textRect` and `hitRect`
   - simplify pagination example
5. Browser proof:
   - status: first Chromium tracer complete
   - add rich Markdown pagination route
   - add Chromium rows first, then expand browser parity once API stabilizes
6. Docs/examples:
   - status: first reference/example tracer complete
   - document raw Slate substrate, Plate/app ownership for Markdown/table
     packages, and pagination layout proof

## Fast Driver Gates

Planning-only gate:

```bash
# cwd: /Users/zbeyens/git/plate-2
node tooling/scripts/completion-check.mjs --id 019e46be-4ec4-7d11-bc6e-9fcf033a8803
```

Implementation gates after Ralph changes `.tmp/slate-v2`:

```bash
# cwd: /Users/zbeyens/git/plate-2/.tmp/slate-v2
bun --filter slate-layout test
bun --filter slate-layout-pretext test
bun --filter slate-layout typecheck
bun --filter slate-layout-pretext typecheck
bun typecheck:site
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/pagination.test.ts --project=chromium
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/markdown-rich-text.test.ts --project=chromium
bun lint:fix
bun check
```

Markdown/table package gates belong in Plate/app package work, not raw Slate
pagination gates.

## Recommended API Shape

Keep the existing geometry/projection entry point, but make it run-aware and
box-aware, and return both visual and native-hit rectangles:

```ts
const projection = getSlatePageLayoutProjection(snapshot, {
  geometry,
  hitTesting: {
    blockGap: { max: 48, target: 'previous-line-end' },
    inlineInset: 2,
  },
})
```

Target projection data:

```ts
type SlatePageLayoutProjectedLine = {
  blockIndex: number
  fragmentId: string
  lineIndex: number
  pageIndex: number
  path: Path
  range: {
    end: number
    start: number
  }
  textRect: SlatePageRect
  hitRect: SlatePageRect
}
```

Table projection:

```ts
const projection = getSlatePageLayoutProjection(snapshot, { geometry })

projection.tables.get(pathKey)?.rows[0]?.cells[2].rect
```

Add one decoration bridge so examples do not reimplement text-span mapping:

```ts
const projectedDecorations = getSlatePageLayoutDecorations(projection, {
  data: ({ line, run }) => ({ paginationLine: { line, run } }),
})

const decorate: EditableDecorate<PaginationLineDecorationData> = ([node, path]) =>
  NodeApi.isText(node) ? projectedDecorations.get(path) : []
```

Then the example stays focused on actual rendering:

```tsx
const renderElement = ({ attributes, children }) => {
  const block = projection.blocks.get(attributes['data-slate-path'])

  return (
    <div {...attributes} style={blockStyle(block)}>
      {children}
    </div>
  )
}

const renderLeaf = ({ attributes, children, segment }) => {
  const line = getProjectedLine(segment)

  return (
    <span {...attributes} style={lineStyle(line)}>
      {children}
    </span>
  )
}
```

This cuts the dirty part: examples no longer compute text spans, next-block
gaps, line hit widths, table boxes, or decoration ranges.

## Rewrite Call

Rewrite:

- `buildPaginationProjection` should move out of the example.
- Text-span-to-line-decoration mapping should be replaced by run-aware layout
  output and a layout helper.
- Table boundary guards should move out of `site/examples/ts/tables.tsx` into a
  table extension with map-aware commands and tests.
- Markdown shortcuts should move out of `site/examples/ts/markdown-shortcuts.tsx`
  into a Markdown input-rule package.
- `hitWidth`/`hitHeight` should become `hitRect` on projected lines.
- The range mapping should be linear per block, not line-count multiplied by
  leaf-count.

Do not rewrite:

- `PagedEditable` page-surface/editor-overlay ownership.
- `pageSettings` as an editor state field.
- Pretext as the measuring engine boundary.
- Native DOM selection for intra-line caret resolution. Do not hand-roll
  x-to-offset until Pretext exposes the caret geometry needed to do that
  honestly.
- Browser integration tests around native click behavior.

## Proof Plan

Unit tests in `slate-layout`:

- Empty paragraph projects to a non-zero block rect.
- Blank tail hit rect reaches the content frame end without changing text rect.
- Vertical gap policy maps the small gap after a block to the previous line hit
  target.
- Spread geometry keeps projected rects in the same coordinate space as page
  placements.
- Rich text span mapping is linear and preserves leaf paths.
- Mixed bold/plain/italic leaves measure as separate runs and project back to
  exact Slate leaf paths.
- Atomic inline runs can reserve extra width without breaking paragraph
  projection.
- Code fences project each code line with monospace metrics and stable
  line-path mapping.
- Lists expose marker/indent boxes separately from paragraph text boxes.
- Tables expose table, row, and cell boxes; row pagination never splits a row
  unless an oversized-row fallback is explicitly active.
- Thematic breaks and images project as atomic boxes with no fake text runs.

Plate/app Markdown package tests:

- CommonMark block parse/serialize round-trip for headings, paragraphs,
  blockquotes, ordered/bulleted lists, code fences, indented code, thematic
  breaks, links, images, inline code, emphasis, strong, hard/soft breaks, and
  escaping.
- GFM table round-trip including alignment row and escaped pipes.
- GFM task list round-trip preserving checked state.
- Markdown input rules create current Slate nodes through public extension
  commands, not example-local transforms.
- Paste/import uses ProseMirror-style bulk fitting semantics: normalize once at
  the boundary, not broad post-hoc cleanup after every inserted node.

Plate/app table package tests:

- table map repairs missing cells and validates spans
- row/column insert/delete/move preserve rectangular grid
- cell selection maps to deterministic Slate ranges
- Backspace/Delete at cell edges never escapes or corrupts the table
- Enter/Tab/Shift+Tab behavior matches table editing contract
- header row and alignment markers serialize to GFM Markdown

Browser tests in the pagination example:

- Blank tail click selects paragraph end.
- Mid-gap click between two paragraphs selects the adjacent expected boundary.
- Repeated leading `insertBreak` creates visible editable empty paragraphs.
- One Backspace removes one leading empty paragraph.
- Debug frame contains the caret.
- Mixed rich Markdown page fixture with headings, lists, links, inline code,
  code fence, image, table, task list, blockquote, and thematic break renders
  without horizontal page scroll.
- Editing before a table keeps table projection anchored to the correct page.
- Cell click, Tab, Shift+Tab, and arrow navigation keep visible selection inside
  the expected cell.
- Copy/paste of a selected table region preserves rectangular content.
- Pagination debug overlay shows row/cell boxes inside page content frames.

Performance/stress tests:

- 10k paragraph Markdown fixture: layout invalidates only changed block/run
  ranges.
- 1k-row table fixture: table map recomputation is scoped to changed table.
- 100-page document with tables and code fences: page projection stays bounded
  by dirty pages plus viewport overscan.
- Paste 1MB Markdown: parse and bulk insert use one transaction and one layout
  refresh batch.
- Interaction budgets: normal typing p95 under 16ms for visible page, table
  navigation p95 under 16ms for visible table, paste/layout may be async or
  transition-backed with explicit progress state.

Non-claims to preserve:

- No mobile/IME claim.
- No cross-page selection/copy claim.
- No production pagination promise until helper APIs have unit coverage and
  browser proof across the real target browsers.
- No full Markdown compliance claim until CommonMark/GFM corpus fixtures pass.

## Issue And PR Accounting

ClawSweeper status: skipped for this pass. Reason: this activation changes a
planning target only and makes no new implementation, browser behavior, issue
fix, or PR auto-close claim. Existing issue-ledger evidence was still read for
the related surface.

Current issue mapping:

| Issue | Cluster | Claim | Why | Proof route | V2 sync ledger | PR line |
| ----- | ------- | ----- | --- | ----------- | -------------- | ------- |
| `#6034` | table DOM selection | Existing fixed claim, unchanged | Current plan uses the table boundary as architectural pressure for generic selection/layout substrate, but adds no new implementation proof. | Existing coverage matrix and PR reference fixed claim. | unchanged | unchanged |
| `#5945` | large paste performance | Related, not claimed | Markdown paste/import must be benchmarked against large-paste pressure in Plate/app package work, but this plan adds no paste implementation. | future Plate/app parse/paste benchmark. | unchanged | related matrix only when implemented |
| `#5131` | selection subscription breadth | Related, not claimed | Table/cell selection and pagination projections must avoid broad subscriptions, but no React runtime code changes here. | future React render benchmark/browser proof. | unchanged | related matrix only when implemented |
| `#5216` | selection latency | Related, not claimed | Paged/table selection needs browser latency proof before any claim. | future browser stress row. | unchanged | related matrix only when implemented |

Fixed issue claims added: none.

Improved issue claims added: none.

PR description update: unchanged. Reason: this is a planning-only Ralplan update
with no new fixed/improved issue count, no `.tmp/slate-v2` implementation proof,
and no current PR-body claim to change. The implementation phase must update
`docs/slate-v2/references/pr-description.md` when layout projection APIs or
generic substrate APIs actually land.

## Maintainer Objection Ledger

| Change | Strong objection | Steelman antithesis | Tradeoff tension | Rejected alternative | Migration answer | Proof required | Verdict |
| ------ | ---------------- | ------------------- | ---------------- | -------------------- | ---------------- | -------------- | ------- |
| Add raw Slate Markdown package | Markdown is product policy; raw Slate should not become Typora. | Keep Markdown examples only and let product layers own everything. | Plate/app packages need a clean substrate, not a bundled raw Slate parser. | Example-local shortcuts are too weak as product guidance, but fine as proof fixtures. | Plate owns package API; raw Slate owns schema/operation/input substrate. | Plate package corpus, input-rule browser rows, paste benchmark. | cut from raw Slate |
| Add raw Slate table package | Tables are endless scope; raw Slate historically keeps examples minimal. | Leave tables to Plate. | Table map/cell selection adds real complexity. | Example-only table guards are insufficient for product docs, but acceptable as raw Slate proof. | Plate owns feature package; raw Slate owns selection/layout/normalization substrate. | Plate table map tests, cell nav browser tests, GFM serialization tests. | cut from raw Slate |
| Make `slate-layout` run-aware | Block-string layout is simpler and already powers the demo. | Delay until mixed-style pagination actually breaks. | More measurement data and cache invalidation. | First-leaf text style: lies for bold/italic/code/link-rich content. | Existing `text/textStyle` can be internal migration only; public examples use projection helper. | mixed-mark layout tests, Pretext rich-inline adapter tests. | keep |
| Make `slate-layout` box-aware for tables/atoms | Layout is becoming a document engine. | Keep pagination text-only until page layout matures. | Box layout must define split/fallback policy. | Treat tables/images/hr as fake text runs: corrupts geometry and selection. | Structured nodes expose boxes through layout adapters; React remains renderer. | table row/cell projection tests, image/hr atomic box tests, browser debug overlay. | keep |
| Add `hitRect` separate from `textRect` | Native hit policy is browser quirk, not layout data. | Keep hit width/height in the example. | More projection data to document. | CSS-only example hacks: hard to test and copy-paste dirty. | Helper defaults can be conservative and optional. | blank-tail/gap unit tests plus Chromium rows. | keep |

## High-Risk Deliberate Pass

Trigger: public package/API architecture, table data model, Markdown
parse/serialize behavior, browser selection, and layout runtime performance.

Blast radius:

- packages: `slate`, `slate-react`, `slate-layout`,
  `slate-layout-pretext`, future Plate Markdown/table packages
- examples: pagination, markdown shortcuts, tables, code highlighting
- behavior: paste/import, input rules, table navigation, cell selection, page
  projection, browser hit testing
- downstream: Plate, Markdown-native products, future slate-yjs/collab adapters

Pre-mortem:

1. Raw Slate Markdown package becomes a product-specific kitchen sink.
   - response: cut the raw package; Plate/app packages own CommonMark/GFM
     syntax.
2. Raw Slate table package becomes impossible to contain.
   - response: cut the raw package; raw Slate exposes generic row/cell box
     inputs and selection/layout substrate.
3. Run-aware layout regresses typing performance on large documents.
   - response: run cache, dirty block/table/page ids, and benchmark gates are
     mandatory before release claim.

Rollback/remediation:

- Markdown/table product APIs are not raw Slate release gates; preserve the page
  overlay and projection APIs while Plate/app packages iterate above them.
- `PagedEditable` stays thin, so layout experiments do not poison core React
  renderer contracts.

## Applicable Review Matrix

| Lens | Status | Findings | Plan delta |
| ---- | ------ | -------- | ---------- |
| `vercel-react-best-practices` | applied | Avoid broad subscriptions; keep Markdown/table rules in transactions; React consumes projection snapshots. | Added performance architecture and budgets. |
| `performance-oracle` | applied | Hot paths are paste, table-map recompute, run measurement, and page projection. | Added 10k-block, 1k-row table, 1MB paste, and p95 budgets. |
| `performance` | applied | Repeated-unit budgets and degradation policy are required before any production pagination claim. | Added explicit budgets and oversized table/wide table policies. |
| `tdd` | applied | Behavior must be proven through package APIs and browser rows, not implementation internals. | Added package, browser, and stress test matrix. |
| `build-web-apps:shadcn` | skipped | No UI component implementation in this pass. | none |
| `react-useeffect` | skipped | No new effect code in this pass. | none |

## Migration Backbone

Plate:

- Plate owns Markdown and table product packages with UI, menus, slash commands,
  docs kits, parse/serialize, input rules, table maps, and table commands.
- Plate should not have to copy projection math or browser hit-target policy.

slate-yjs/collab:

- Markdown import/paste from Plate/app packages commits one deterministic
  transaction.
- Table commands from Plate/app packages emit deterministic operations over
  normalized table structure.
- Layout projection, hit targets, and pagination boxes stay derived view state,
  not collaborative document state.
- Cell selection needs a stable serializable selection/annotation bridge before
  collab claims.

## Final User-Review Handoff Outline

- Public API: do not add raw Slate Markdown/table packages; keep core Slate
  unopinionated.
- Layout: move from block string to run-aware plus box-aware projection.
- Pagination: keep `PagedEditable` thin; move hit target and decoration mapping
  into `slate-layout`.
- Tables: table map, commands, cell selection, and GFM serialization belong in
  Plate/app packages; row/cell box projection inputs belong in Slate layout.
- Markdown: CommonMark/GFM parse/serialize/paste/input rules belong in
  Plate/app packages.
- Tests: package corpus first, table map/command tests, layout projection tests,
  browser rich Markdown pagination, stress/perf gates.
- Non-claims: no mobile/IME, cross-page copy, production pagination, or full
  Markdown compliance claim until matching proof lands.

## Ralplan Scores

- Slate-close unopinionated DX: 0.63 current, 0.93 target.
- React/runtime performance: 0.70 current, 0.92 target.
- Migration backbone for Plate/slate-yjs: 0.70 current, 0.88 target.
- Browser regression proof: 0.80 current, 0.93 target.
- Research grounding: 0.90 current.
- Composability/minimal props: 0.76 current, 0.91 target.

Overall: 0.75 current, 0.92 target.

## Final Decision

Do not call the current shape absolute best. It is a strong experimental
implementation with the right page/editor ownership, but it is not enough for a
Markdown-rich editor. The API is still dirty because reusable layout law is
sitting in the example, and the layout model is still missing run-aware inline
content plus box-aware tables/atoms.

The best next architecture move is not only hit-target cleanup. First keep
Markdown and table product packages out of raw Slate, then make `slate-layout`
run-aware and box-aware using Pretext rich-inline ranges plus table/atomic block
boxes, then promote projection hit targets and decoration mapping into
`slate-layout`, then simplify examples to show only API call sites and rendering
callbacks.

## Ralph Execution Ledger

### 2026-05-22 - Raw Markdown/Table Package Hard Cut

Changed files:

- `.tmp/slate-v2/config/typescript/tsconfig.json`
- raw Slate Markdown/table package directories
- `docs/slate-v2/references/pr-description.md`

What changed:

- Removed raw Slate Markdown and table package surfaces.
- Removed TypeScript path aliases for those packages.
- Reframed Markdown syntax policy and table feature policy as Plate/app package
  ownership.
- Kept Slate responsible for schema/spec policy, transforms, selection
  primitives, normalization, clipboard/input hooks, and layout projection
  primitives.

Next owner:

- `slate-layout` run-aware layout: replace block string-only projection with
  placed runs and leaf-path mapping.

### 2026-05-21 - `slate-layout` Run-Aware Contract Tracer

Changed files:

- `.tmp/slate-v2/packages/slate-layout/src/index.ts`
- `.tmp/slate-v2/packages/slate-layout/test/page-layout-contract.test.ts`
- `.tmp/slate-v2/packages/slate-layout/dist/index.js`
- `.tmp/slate-v2/packages/slate-layout/dist/index.d.ts`
- `.tmp/slate-v2/packages/slate-layout/dist/index.d.ts.map`
- `.tmp/slate-v2/packages/slate-layout/dist/src-DIexvwjR.js`
- `.tmp/slate-v2/packages/slate-layout/dist/src-DIexvwjR.js.map`
- `.tmp/slate-v2/packages/slate-layout-pretext/dist/index.js`
- `.tmp/slate-v2/packages/slate-layout-pretext/dist/index.js.map`
- `docs/slate-v2/references/pr-description.md`

What landed:

- Added `SlatePageLayoutRun` and `SlatePageLayoutPlacedRun`.
- Layout blocks now include extracted leaf runs with Slate leaf paths, block
  offset ranges, text, and per-leaf typography.
- Estimated line projection now emits placed runs with line-relative left/width
  and clipped block ranges.
- Existing block `text` and `textStyle` stay in place as compatibility fallback.

Verification:

- Red tracer first: `bun --filter slate-layout test` failed because
  `block.runs` was missing.
- `bun --filter slate-layout test`: pass, 9 tests, 37 assertions.
- `bun --filter slate-layout typecheck`: pass.
- `bunx biome check packages/slate-layout --fix`: pass.
- `bun --filter slate-layout build`: pass.
- `bun --filter slate-layout-pretext test`: pass, 2 tests, 8 assertions.
- `bun --filter slate-layout-pretext typecheck`: pass.
- `bun --filter slate-layout-pretext build`: pass.

Reference docs:

- `docs/slate-v2/references/pr-description.md` updated to record the run-aware
  layout surface.
- Issue coverage matrix and fork dossier: no change. This slice adds no fixed,
  improved, related, or not-claimed issue rows.

Next owner:

- `slate-layout` box-aware layout: atomic block, code line, image, thematic
  break, and table/cell boxes.

### 2026-05-21 - `slate-layout` Box-Aware Contract Tracer

Changed files:

- `.tmp/slate-v2/packages/slate-layout/src/index.ts`
- `.tmp/slate-v2/packages/slate-layout/test/page-layout-contract.test.ts`
- `.tmp/slate-v2/packages/slate-layout/dist/index.js`
- `.tmp/slate-v2/packages/slate-layout/dist/index.d.ts`
- `.tmp/slate-v2/packages/slate-layout/dist/index.d.ts.map`
- `.tmp/slate-v2/packages/slate-layout/dist/src-DIexvwjR.js`
- `.tmp/slate-v2/packages/slate-layout/dist/src-DIexvwjR.js.map`
- `.tmp/slate-v2/packages/slate-layout-pretext/dist/index.js`
- `.tmp/slate-v2/packages/slate-layout-pretext/dist/index.js.map`
- `docs/slate-v2/references/pr-description.md`

What landed:

- Added `SlatePageLayoutBox`, `SlatePageLayoutBoxKind`, and
  `SlatePageLayoutBoxSplit`.
- Layout blocks now emit derived box metadata for `code-block`,
  `thematic-break`, `image`, `table`, and `table-cell` nodes.
- Boxes carry block-local rects plus split policy metadata, keeping box
  knowledge out of examples and React wrappers.

Verification:

- Red tracer first: `bun --filter slate-layout test` failed because no
  `block.boxes` existed.
- `bun --filter slate-layout test`: pass, 10 tests, 38 assertions.
- `bun --filter slate-layout typecheck`: pass.
- `bunx biome check packages/slate-layout --fix`: pass.
- `bun --filter slate-layout build`: pass.
- `bun --filter slate-layout-pretext test`: pass, 2 tests, 8 assertions.
- `bun --filter slate-layout-pretext typecheck`: pass.
- `bun --filter slate-layout-pretext build`: pass.

Reference docs:

- `docs/slate-v2/references/pr-description.md` updated to record the box-aware
  layout surface.
- Issue coverage matrix and fork dossier: no change. This slice adds no fixed,
  improved, related, or not-claimed issue rows.

Next owner:

- Projection DX: add layout-owned decoration and text/hit rectangle helpers,
  then simplify pagination example.

### 2026-05-21 - `slate-layout` Projection DX Tracer

Changed files:

- `.tmp/slate-v2/packages/slate-layout/src/index.ts`
- `.tmp/slate-v2/packages/slate-layout/test/page-layout-contract.test.ts`
- `.tmp/slate-v2/packages/slate-layout/dist/index.js`
- `.tmp/slate-v2/packages/slate-layout/dist/index.d.ts`
- `.tmp/slate-v2/packages/slate-layout/dist/index.d.ts.map`
- `.tmp/slate-v2/packages/slate-layout/dist/src-DIexvwjR.js`
- `.tmp/slate-v2/packages/slate-layout/dist/src-DIexvwjR.js.map`
- `.tmp/slate-v2/packages/slate-layout-pretext/dist/index.js`
- `.tmp/slate-v2/packages/slate-layout-pretext/dist/index.js.map`
- `.tmp/slate-v2/site/examples/ts/pagination.tsx`

What landed:

- Added `textRect` and `hitRect` to projected layout lines.
- Added `hitTesting.inlineInset` plus block-gap hit extension policy to
  `getSlatePageLayoutProjection`.
- Added `getSlatePageLayoutDecorations`, block/page rect spaces, and exported
  `getSlatePageLayoutPathKey`.
- Placed runs now carry `leafRange`, so decoration ranges map to Slate text
  offsets without example-local text-span walking.
- Simplified the pagination example to consume layout-owned projection helpers
  instead of computing text spans, blank-tail widths, and paragraph-gap hit
  heights locally.

Verification:

- Red tracer first: `bun --filter slate-layout test` failed because
  `getSlatePageLayoutDecorations` was not exported.
- `bun --filter slate-layout test`: pass, 12 tests, 42 assertions.
- `bun --filter slate-layout typecheck`: pass.
- `bun typecheck:site`: pass.
- `bunx biome check packages/slate-layout site/examples/ts/pagination.tsx --fix`:
  pass.
- `bun --filter slate-layout build`: pass.
- `bun --filter slate-layout-pretext test`: pass, 2 tests, 8 assertions.
- `bun --filter slate-layout-pretext typecheck`: pass.
- `bun --filter slate-layout-pretext build`: pass.
- `bun run lint:fix`: pass.
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/pagination.test.ts --project=chromium`:
  pass, 3 tests.
- In-app Browser proof attempted against `http://localhost:3101/examples/pagination`;
  reload was blocked by Browser URL policy, so no Browser screenshot claim is
  made for this slice.

Reference docs:

- Issue coverage matrix and fork dossier: no change. This slice adds no fixed,
  improved, related, or not-claimed issue rows.

Next owner:

- Browser proof and rich Markdown route: add the mixed Markdown pagination
  fixture, then expand browser rows around tables, code, images, and debug
  boxes.

### 2026-05-21 - Pagination Rich Markdown Browser Proof

Changed files:

- `.tmp/slate-v2/site/examples/ts/custom-types.d.ts`
- `.tmp/slate-v2/site/examples/ts/pagination.tsx`
- `.tmp/slate-v2/playwright/integration/examples/pagination.test.ts`
- `docs/slate-v2/references/pr-description.md`

What landed:

- Added a mixed Markdown-shaped pagination fixture with heading, marked text,
  blockquote, task item, code block, table, image, thematic break, and trailing
  paragraph.
- Added pagination render branches for table rows/cells, image, thematic
  break, blockquote, code-block styling, mark styling, viewport test id, and
  debug outline hooks.
- Kept flow-rendered structured blocks out of absolute line decorations while
  preserving layout-owned decorations for normal text blocks.
- Added a Chromium browser row proving the mixed fixture renders inside content
  frames, has no horizontal page scroll, and keeps table/image/thematic-break
  bounds inside the debug frame.
- Updated `docs/slate-v2/references/pr-description.md` with the current
  pagination proof files and accepted API shape.

Verification:

- `bun --filter slate-layout test`: pass, 12 tests, 42 assertions.
- `bun --filter slate-layout typecheck`: pass.
- `bun typecheck:site`: pass.
- `bun run lint:fix`: pass.
- `bun --filter slate-layout build`: pass.
- `bun --filter slate-layout-pretext test`: pass, 2 tests, 8 assertions.
- `bun --filter slate-layout-pretext typecheck`: pass.
- `bun --filter slate-layout-pretext build`: pass.
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/pagination.test.ts --project=chromium`:
  pass, 4 tests.

Reference docs:

- `docs/slate-v2/references/pr-description.md` updated for package/example
  proof accounting.
- Issue coverage matrix and fork dossier: no change. This slice adds no fixed,
  improved, related, or not-claimed issue rows.

Next owner:

- Closure review. Do not claim production pagination, full Markdown compliance,
  mobile/IME, or cross-page selection/copy; the current lane is an
  experimental architecture tracer with focused Chromium proof.

### 2026-05-21 - Pagination Fixture and Avoid-Split Structured Blocks

Changed files:

- `.tmp/slate-v2/packages/slate-layout/src/index.ts`
- `.tmp/slate-v2/packages/slate-layout/test/page-layout-contract.test.ts`
- `.tmp/slate-v2/site/examples/ts/pagination.tsx`
- `.tmp/slate-v2/playwright/integration/examples/pagination.test.ts`
- `.tmp/slate-v2/.changeset/slate-layout-avoid-split-boxes.md`
- `docs/plans/2026-05-21-slate-v2-pagination-page-flow-fix.md`

What landed:

- Removed seeded empty spacer paragraphs from the synthetic Premirror fixture.
- Made root `split: 'avoid'` layout boxes move whole to the next page when the
  block fits on a fresh page but not the current page remainder.
- Marked `code-block` root boxes as avoid-split while keeping individual
  code-line boxes line-aware for oversized blocks.
- Added browser coverage proving the fixture has no blank spacer and rich code
  blocks stay inside debug content frames.

Verification:

- `bun --filter slate-layout test`: pass, 13 tests.
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/pagination.test.ts --project=chromium`:
  pass, 6 tests.
- Browser proof at `http://localhost:3100/examples/pagination`: the third
  paragraph is followed directly by the fourth paragraph, `codeBlockInsideFrame:
  true`, `noHorizontalScroll: true`.

Next owner:

- Keep this as experimental pagination proof. Real production pagination still
  needs fragmented block boxes instead of one projected block per Slate path.

### 2026-05-21 - Native Backspace After Space-Split Leading Breaks

Changed files:

- `.tmp/slate-v2/packages/slate/src/transforms-text/delete-text.ts`
- `.tmp/slate-v2/packages/slate/test/delete-contract.ts`
- `.tmp/slate-v2/playwright/integration/examples/pagination.test.ts`
- `.tmp/slate-v2/.changeset/slate-delete-leading-breaks.md`

What landed:

- Added a core regression for repeated `insertBreak`, space insertion,
  `insertBreak`, then Backspace.
- Added a Chromium pagination regression using native `Enter`, `Space`, `Enter`,
  and `Backspace`.
- Bounded post-delete top-level empty-block cleanup to the active delete range
  so unrelated leading blank paragraphs survive when a whitespace block merges
  with the following paragraph.

Verification:

- `bun test ./packages/slate/test/delete-contract.ts --bail 1`: pass, 15 tests.
- `bun test ./packages/slate/test --bail 1`: pass, 975 tests.
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/pagination.test.ts --project=chromium`:
  pass, 7 tests.
- In-app Browser proof at `http://localhost:3100/examples/pagination`: after
  native `Enter` x4, `Space`, `Enter`, `Backspace`, the first blocks remain four
  empty paragraphs followed by the merged space-prefixed paragraph.

## Pass-State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| ---- | ------ | -------------- | ---------- | ----------- | ---------- |
| current-state-read | complete | live pagination, markdown-shortcuts, tables, custom types, layout, Premirror, Pretext, Typora/Lexical/Tiptap research | expanded scope from pagination-only to rich Markdown plus table/layout architecture | issue-ledger and ClawSweeper pass still pending | Slate Ralplan |
| rich-markdown-architecture-decision-brief | complete | principles, drivers, options, rejected alternatives, Markdown/table architecture | chose Plate/app ownership for Markdown/table packages plus run/box-aware layout in Slate | none | done |
| issue-ledger-accounting | complete | existing coverage matrix, v2 sync ledger, PR reference | no new fixed/improved claims; related issue pressure recorded | implementation must update ledgers when code lands | Ralph implementation |
| ecosystem-synthesis | complete | Premirror, Pretext, Typora, Lexical, Tiptap | mapped what to steal/reject | none | done |
| maintainer-objection-ledger | complete | five objection rows | accepted keep/reject choices with proof gates | none | done |
| high-risk-deliberate-pass | complete | blast radius, pre-mortem, rollback | added phase and proof requirements | none | done |
| closure-score-final-gates | complete | scorecard, proof plan, fast gates, final handoff outline | Ralplan ready for user review; implementation now started through Ralph | remaining implementation and verification stay in Ralph execution | Ralph |
| ralph-execution-slice-1 | complete | raw Markdown/table package hard cut, config cleanup, PR reference sync | removed package tracers and reset ownership to Plate/app layer | layout integration and browser proof still pending | `slate-layout` run-aware layout |
| ralph-execution-slice-2 | complete | superseded by hard cut | package-tracer slice removed from raw Slate scope | run-aware layout, box-aware layout, projection DX, browser proof still pending | `slate-layout` run-aware layout |
| ralph-execution-slice-3 | complete | `slate-layout` run-aware contract, tests, typecheck, scoped lint, dependent pretext gates | third implementation phase started with a public layout tracer | box-aware layout, projection DX, browser proof still pending | `slate-layout` box-aware layout |
| ralph-execution-slice-4 | complete | `slate-layout` box-aware contract, tests, typecheck, scoped lint, dependent pretext gates | fourth implementation phase started with a public layout tracer | projection DX and browser proof still pending | `slate-layout` projection DX |
| ralph-execution-slice-5 | complete | `slate-layout` projection helpers, text/hit rects, decorations, simplified pagination example, focused package/site/browser gates | fifth implementation phase moved example-local hit/decorations math into layout | rich Markdown route and broader browser proof still pending | pagination browser proof |
| ralph-execution-slice-6 | complete | mixed Markdown pagination fixture, render branches, Chromium scroll/frame proof, PR reference sync | first browser proof tracer covers tables/code/image/hr/debug frame inside pagination | full Markdown corpus, browser parity, production pagination, mobile/IME, cross-page copy remain non-claims | closure review |
| ralph-execution-slice-7 | complete | run-scoped decoration rect contract, Chromium mixed-inline overlap proof, in-app Browser screenshot | per-run decoration data now carries per-run text rects and final-run hit tails instead of line-wide rects | pretext still needs true rich-inline measurement before production pagination claims | rich-inline measurement lane |
| ralph-execution-slice-8 | complete | Pretext measured run positions, visual gap regression, clean screenshot proof | `slate-layout-pretext` now emits measured per-run widths from each run font instead of letting `slate-layout` estimate them | production pagination still needs richer line breaking for mixed fonts, but the example no longer teaches broken spacing | rich-inline line-break lane |
