---
title: Slate layout packages need source-entry ambient refs and editable z-index ownership
date: 2026-05-21
last_updated: 2026-05-22
category: docs/solutions/developer-experience
module: slate-v2
problem_type: developer_experience
component: tooling
symptoms:
  - "A new source-first package typecheck pulled dependency source without its ambient declarations"
  - "A paged wrapper made the editable visible but normal pointer clicks hit the page chrome"
  - "A state-field control subscribed twice to the same object settings and caused render churn"
  - "A paged example inherited the narrow examples wrapper and produced horizontal page scroll"
  - "A layout API accepted a root option but still extracted and projected default-root ranges"
  - "Typing into the paged editor grew the first page surface instead of keeping page chrome fixed"
  - "The pagination example still opened on one visible page because it lacked Premirror-style fragment-positioned content"
  - "Repeated insertBreak at the document start created invisible empty paragraphs"
  - "Backspace at the start of the original block removed every preceding empty paragraph"
  - "Backspace after repeated Enter, Space, Enter deleted unrelated leading empty paragraphs instead of only merging the current break"
  - "Clicking the blank tail at the end of a projected paragraph selected offset 0 instead of the paragraph end"
  - "Clicking the vertical blank gap between projected paragraphs selected a non-adjacent caret target"
  - "The pagination example owned text-span walking, line hit widths, and paragraph-gap hit heights instead of using a layout API"
  - "Rich Markdown-shaped content needed browser proof that tables, images, code, and thematic breaks stayed inside page frames without horizontal scroll"
  - "Typing spaces at the end of a projected paragraph advanced Slate state but left trailing DOM text outside the absolute projected line"
  - "Mixed inline leaves in the rich Markdown pagination fixture all painted at the same absolute left/top and overlapped"
  - "Mixed inline leaves stopped overlapping but still had ugly gaps because run positions used fixed-width estimates"
root_cause: incomplete_setup
resolution_type: code_fix
severity: medium
tags: [slate-v2, source-first, ambient-types, paged-editable, z-index, insertBreak, deleteBackward, selection, pagination, layout-projection, whitespace, run-scoped-decorations]
---

# Slate layout packages need source-entry ambient refs and editable z-index ownership

## Problem

The experimental Slate layout packages typechecked through monorepo path aliases
and rendered an editable inside page chrome. The API looked clean at the call
site, but source-first package checks and browser proof exposed two hidden DX
failures.

## Symptoms

- `slate-layout` typecheck pulled `slate-react` / `slate-dom` source and missed
  package-local ambient declarations such as `dom-globals.d.ts` and
  `@types/direction.d.ts`.
- The pagination route rendered, but Playwright could not click the editable
  because the page wrapper intercepted pointer events.
- Reading page settings through `useStateFieldValue(pageSettings)` separately
  from the layout snapshot created an avoidable object-subscription loop.
- Typing spaces at the end of a paged paragraph updated Slate text and
  selection, but the trailing spaces rendered as an unprojected transparent leaf
  because layout ranges ended before those positions.

## What Didn't Work

- Adding a local ambient shim inside the new package would have hidden the real
  source-entry contract problem.
- Setting `zIndex: 0` only in the example would have made `PagedEditable` easy to
  use wrong in the next example.
- Setting fixed `height: page.height` on the same wrapper that contained the
  editable hid the symptom by clipping or colliding with continuous content.
- Keeping the pagination route inside the default `.example-content` card made
  A4 and facing-page layouts fight a 42em wrapper instead of behaving like a
  document viewport.
- Accepting `root` in a layout API without binding extraction and range
  projection to that root made the API look multi-root-ready while still
  behaving as a default-root shortcut.
- Subscribing to the same page settings field just for toolbar controls made the
  example more complex than the API being demonstrated.
- Letting the Pretext engine use CSS-normal whitespace looked reasonable for
  static prose, but Slate editable text uses real whitespace positions. Normal
  whitespace mode trims trailing collapsible spaces from projected line ranges.

## Solution

Make dependency source entries carry their own ambient declarations:

```ts
/// <reference path="./dom-globals.d.ts" />
```

```ts
/// <reference path="./@types/direction.d.ts" />
/// <reference path="./dom-globals.d.ts" />
```

Make `PagedEditable` own the editable stacking fix by default:

```tsx
const editable = (
  <Editable {...editableProps} style={{ zIndex: 0, ...style }} />
)
```

Page geometry should be a shared view primitive, not ad hoc CSS in each example:

```ts
const geometry = getSlatePageLayoutGeometry(snapshot.pages, {
  pageGap: 24,
  pageLayoutMode: 'spread',
})
```

`PagedEditable` should render fixed page surfaces and a single editor overlay as
siblings. The editor overlay covers the whole page stack like Premirror, and
`renderPage` is page chrome only; it should not receive the editable as children:

```tsx
<div data-slate-paged-editable style={{ position: 'relative' }}>
  {pages.map((page) => (
    <div data-slate-page-surface style={{ position: 'absolute' }}>
      {renderPage({ attributes, children: null, page })}
    </div>
  ))}
  <div data-slate-paged-editable-editor-overlay style={{ position: 'absolute' }}>
    <div data-slate-paged-editable-editor style={{ position: 'absolute' }}>
      <Editable {...editableProps} style={{ position: 'relative', zIndex: 0 }} />
    </div>
  </div>
</div>
```

The layout engine should expose per-line ranges so examples can project text into
page coordinates:

```ts
fragment.lines.map((line) => ({
  range: {
    anchor: { path, offset: line.start },
    focus: { path, offset: line.end },
  },
  data: {
    paginationLine: {
      left: pagePlacement.left + page.content.left,
      top: pagePlacement.top + line.top,
    },
  },
}))
```

The example can then render those decorated leaves as absolute line fragments:

```tsx
renderLeaf={({ attributes, children, segment }) => {
  const line = segment.slices.find((slice) => slice.data?.paginationLine)
    ?.data?.paginationLine

  return line ? (
    <span {...attributes} style={{ position: 'absolute', left: line.left, top: line.top }}>
      {children}
    </span>
  ) : (
    <span {...attributes}>{children}</span>
  )
}}
```

Expose block and line projection as a layout API, not example-only math:

```ts
const projection = getSlatePageLayoutProjection(snapshot, { geometry })
```

Use projected block boxes for real editable paragraph elements and projected
line boxes for relative leaf positioning. Empty paragraphs still need a
full-width, non-zero-height block box even when their text line has `width: 0`.

Bridge those boxes by Slate path, not element object identity:

```tsx
const box = projectionByPath.get(attributes['data-slate-path'])
```

Render the block as the caret target and the leaf as the visible line:

```tsx
<div
  {...attributes}
  style={{ position: 'absolute', left: box.left, top: box.top, height: box.height }}
>
  {children}
</div>
```

Projected line leaves also need an invisible hit width that extends through the
blank tail of the paragraph. Keep measured text width as layout data, but render
the leaf box wide enough for native click resolution:

```tsx
paginationLine: {
  width: line.width,
  hitWidth: Math.max(
    line.width,
    blockBox.width - inlineInset - (line.left - blockBox.left)
  ),
}
```

```tsx
<span style={{ position: 'absolute', width: line.hitWidth }}>
  {children}
</span>
```

The same rule applies vertically. Paragraph spacing must still belong to an
adjacent line hit target, otherwise a click between paragraphs hits only the
editable root and the browser can resolve the caret to an unrelated projected
block. Extend the previous block's last line through the following small block
gap while keeping the visual line-height unchanged:

```tsx
paginationLine: {
  height: line.height,
  hitHeight: isLastLine ? line.height + nextBlockGap : line.height,
}
```

```tsx
<span
  style={{
    height: line.hitHeight,
    lineHeight: `${line.height}px`,
  }}
>
  {children}
</span>
```

Once the behavior is proven, move that projection math behind `slate-layout` so
examples show API use instead of private layout bookkeeping:

```ts
const projection = getSlatePageLayoutProjection(snapshot, {
  geometry,
  hitTesting: { inlineInset: 2 },
})

const decorations = getSlatePageLayoutDecorations(projection, {
  rects: 'block',
  data: ({ rects }) => ({ paginationLine: rects }),
})
```

Projected runs need both block offsets and leaf offsets. The line keeps
`textRect` for visual placement and `hitRect` for native click resolution; the
decoration helper uses `leafRange` so callers do not walk `NodeApi.texts(...)`
in React examples:

```ts
type SlatePageLayoutProjectedLine = {
  hitRect: SlatePageRect
  textRect: SlatePageRect
}

type SlatePageLayoutPlacedRun = {
  leafRange: { start: number; end: number }
  path: Path
}
```

Decoration rects must also be run-scoped. Iterating per placed run while passing
line-wide rects is a dirty half-abstraction: every leaf receives the same
absolute `left`/`top` and mixed inline content piles onto itself. Build each
decoration from the run's `left` and `width`, then extend only the final run's
`hitRect` through the line tail for native blank-tail clicks:

```ts
const textRect = {
  height: line.textRect.height,
  left: line.textRect.left + run.left,
  top: line.textRect.top,
  width: run.width,
}
const hitRight =
  run.range.end >= line.end
    ? Math.max(line.hitRect.left + line.hitRect.width, textRect.left + textRect.width)
    : textRect.left + textRect.width
```

Run positions must come from the active layout engine, not the estimated fallback
in `slate-layout`. For Pretext-backed pages, measure every line run with that
run's own font and letter spacing before pagination returns fragments:

```ts
const width = measureNaturalWidth(
  prepareWithSegments(runText, run.textStyle.font, {
    letterSpacing: run.textStyle.letterSpacing,
    whiteSpace,
    wordBreak,
  })
)
```

For mixed Markdown proof, keep structured blocks honest: flow-render table,
image, and thematic-break elements inside the projected block box, and leave
line decorations to ordinary text blocks until table/cell projection is deep
enough to own real grid selection.

Custom page renderers should keep page chrome fixed:

```tsx
style={{
  height: page.height,
  overflow: 'hidden',
  width: page.width,
}}
```

Document-style pagination examples should own an immersive shell under the
examples header and scale their page stack to the viewport:

```tsx
<div className={viewportCss} ref={viewportRef}>
  <div style={{ height: unscaledHeight * pageScale }}>
    <div style={{ transform: `scale(${pageScale})`, width: pageStackWidth }}>
      <PagedEditable pageLayoutMode="spread" />
    </div>
  </div>
</div>
```

Root-bound layout stores must expose root ownership in their snapshot and reject
projection for ranges that belong to a different root:

```ts
const layout = createSlatePageLayout(editor, () => ({
  engine,
  root: 'header',
}))

layout.getSnapshot().root // 'header'
layout.projectRange({
  anchor: { root: 'header', path: [0, 0], offset: 0 },
  focus: { root: 'header', path: [0, 0], offset: 6 },
})
```

Range projection should use the same page geometry options as the visible page
layout, including facing spreads:

```ts
layout.projectRange(range, {
  pageGap: 24,
  pageLayoutMode: 'spread',
})
```

Use the layout snapshot as the page-settings read model in examples:

```tsx
const layout = useSlatePageLayout(editor, {
  engine,
  settings: pageSettings,
  typography,
})
const snapshot = useSlatePageLayoutSnapshot(layout)
const settings = snapshot.settings
```

Keep Pretext preparation in the engine closure, not React render:

```ts
const preparedCache = new Map<string, ReturnType<typeof prepare>>()
```

Slate-backed Pretext layout should default to editable whitespace semantics:

```ts
const prepared = prepareWithSegments(text, font, {
  letterSpacing,
  whiteSpace: 'pre-wrap',
  wordBreak: 'normal',
})
```

Expose `whiteSpace` and `wordBreak` as engine options for static-layout callers,
but keep the default aligned with Slate's editable DOM so trailing spaces,
explicit line breaks, and projected leaf ranges stay addressable.

## Why This Works

Source-first package checks compile dependency source through path aliases, so
ambient declarations must be reachable from the package source entry, not only
from that package's own `tsconfig.include`. `PagedEditable` wraps an `Editable`
inside page chrome; because raw `Editable` defaults to `zIndex: -1`, the wrapper
must establish the interactive stacking context itself.

Until Slate supports true fragmented editable DOM, page chrome cannot wrap the
full editable tree. Fixed page surfaces are correct only when they are siblings
of a full-stack editor overlay. Premirror's useful trick is not just the page
stack; it is projecting document fragments into absolute page coordinates. Slate
can demo the same architecture with range decorations, even though production
cross-page editing/selection still needs deeper runtime work.

Paged examples are not ordinary rich-text examples. They need a document canvas,
not a centered docs card. Scaling the page stack keeps `single` and `spread`
layout modes usable inside the existing example route without introducing
horizontal document scroll.

Layout is derived view data, but it still participates in the root/view
architecture. A root-bound layout should read blocks from that root and project
only root-compatible ranges. Rootless ranges remain acceptable at the public
single-root edge, but the layout normalizes them against its root before doing
any projection.

Reading page settings from the layout snapshot keeps the example centered on one
store: state fields own persisted settings, while the layout store owns derived
page data.

Pretext's normal whitespace mode is right for CSS-normal static text because it
collapses and trims boundary whitespace. A Slate editable is not static prose:
the trailing spaces are real offsets that selection, native input repair, and
projected leaf decorations must preserve. Using `pre-wrap` keeps Pretext's line
ranges and Slate's DOM text positions in the same coordinate space.

Backspace across repeated leading empty paragraphs needs a command-level guard:
when the caret is at the start of a block and the previous top-level block is
empty, remove that previous block as a path target. Do not turn that gesture into
a hanging range cleanup, because structural cleanup will erase the whole empty
run in one command.

When Backspace merges a whitespace-only paragraph with the following paragraph,
range cleanup must stay bounded to the active delete range. Global top-level
empty-block cleanup will erase unrelated blank paragraphs created by earlier
Enter presses.

Run-scoped decoration rects match the actual abstraction boundary. The layout
line owns page-relative visual and hit geometry; the placed run owns inline
advance and leaf-local offsets. Combining those once in `slate-layout` prevents
every React example from rebuilding offset math and keeps final-run blank-tail
selection behavior compatible with mixed inline rendering.

The Pretext engine must emit measured run positions because the fallback run
builder is intentionally approximate. It is good enough for source-free lines,
but it is not acceptable for a browser-visible rich-text example: Helvetica
regular, Helvetica bold/italic, and monospace code all have different advances.
Once decorations are run-scoped, bad run widths become visible as gaps.

## Prevention

- When a package is consumed through path aliases, put compile-time ambient
  references on the source entry that downstream packages import.
- Browser-proof any wrapper around `Editable`; visible text is not enough. Click
  and type through the real `[contenteditable="true"]` target.
- In custom `renderPage`, use fixed `height` for page chrome and keep the
  editable out of that subtree.
- For page-spread examples, make the page wrapper own `single`/`spread` layout
  and viewport scaling; do not leave that as ad hoc example CSS.
- Put single/spread placement in a tested geometry helper so page rendering and
  range projection cannot drift.
- If the example should prove pagination, seed it with enough paragraph content
  to open on multiple pages and render the line fragments into page coordinates.
- Empty inserted blocks need block boxes, not just zero-width line decorations.
- Do not key render-time layout by element object identity; rendered Slate
  elements may not be the same objects captured in a derived layout snapshot.
  Use `data-slate-path` or a real path hook when render UI depends on path.
- Add browser coverage for repeated `insertBreak` plus Backspace when a paged
  example uses custom `renderElement` and absolute leaves.
- Add a native browser row for `Enter` x N, `Space`, `Enter`, `Backspace`.
  Programmatic `deleteBackward()` coverage alone misses the whitespace block
  merge path.
- If an API accepts `root`, add tests proving extraction, snapshots, and range
  projection all use that root. Fake root support is worse than no root support.
- If an example already subscribes to a derived store, do not separately
  subscribe to object state fields unless the second subscription has a stable
  equality story.
- Pretext-backed engines should cache prepared text by text/style inputs and run
  only cheap layout work on refresh.
- Include whitespace mode and word-break mode in Pretext cache keys; otherwise
  the same text/font pair can reuse layout data with different editable
  semantics.
- Add both a package contract and a browser row for trailing editable spaces:
  the package test should assert projected line `end === text.length`, and the
  browser test should assert the final rendered leaf is still absolutely
  projected after typing spaces at paragraph end.
- Do not let examples own line-decoration projection once the behavior becomes
  a reusable layout contract. Promote it to `slate-layout` and keep the example
  focused on `renderElement` / `renderLeaf`.
- Give projected lines separate `textRect` and `hitRect`; CSS-only blank-tail
  and paragraph-gap hacks are hard to test and easy to copy wrong.
- Preserve leaf-relative offsets on placed runs. Block offsets alone are not
  enough to build Slate text ranges without re-walking the element tree.
- Assert mixed inline leaves do not overlap when claiming run-aware pagination.
  Package coverage should prove decoration rects differ per run; browser
  coverage should group rendered leaves by visual row and fail if adjacent leaf
  boxes overlap.
- Only the final run on a projected line should inherit the full line-tail hit
  width. Giving every run the line-wide `hitRect` recreates the overlap bug.
- Do not let Pretext-backed pagination fall back to fixed-width run estimates.
  Add a package test with mixed regular/bold/monospace runs and a browser row
  that fails when non-final leaf boxes contain more than a small trailing-space
  allowance.
- Add one mixed-content browser row when pagination claims Markdown-shaped
  support. At minimum, assert no horizontal scroll and that table/image/hr
  bounds stay inside debug content frames.
- Do not seed blank spacer paragraphs in pagination examples. If the layout
  needs extra pressure, add real content; fixtures should not normalize bad
  document practices.
- Structured blocks with root `split: 'avoid'` should move whole to the next
  page when they fit on a fresh page. Otherwise one projected block rect can
  union fragments across facing pages and paint through the gutter.

## Related Issues

- [Slate React state field setters must preserve external focus](../ui-bugs/2026-05-20-slate-react-state-field-setters-must-preserve-external-focus.md)
- [TypeScript workspace subpath aliases in `apps/www`](./2026-03-12-typescript-workspace-subpath-aliases-in-apps-www.md)
