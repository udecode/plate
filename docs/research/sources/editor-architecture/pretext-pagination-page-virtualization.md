---
type: source-summary
status: draft
date: 2026-05-25
source_family: pretext pagination virtualization
---

# Pretext Pagination And Page Virtualization

## Scope

Evidence for the Slate v2 pagination / virtualization planning lane.

Sources:

- live `../pretext` source and research log, read on 2026-05-25.
- live `.tmp/slate-v2` layout and React source, read on 2026-05-25.
- Cyrus Radfar, "Pretext is a text measurement library. The most interesting
  use cases have no DOM at all.", fetched on 2026-05-25.
- local `../tiptap-docs` Pages limitations and table-with-pages docs, read on
  2026-05-25.
- Tiptap Pages limitations and table-with-pages docs, fetched on 2026-05-25.
- Romik Makavana Medium pagination article URL, attempted on 2026-05-25; curl
  returned a Cloudflare challenge, so this page treats the user-provided summary
  as review context and uses local/official Tiptap Pages docs for current
  Tiptap evidence.

## Current Conclusion

Use Pretext as the layout engine, but be honest about the measurement contract.

Pretext is excellent for avoiding hot-path DOM reflow:

- `../pretext/src/layout.ts:668` documents `prepare()` as the one-time segment
  measurement path.
- `../pretext/src/layout.ts:696` documents `layout()` as arithmetic over cached
  widths.
- `../pretext/RESEARCH.md:20` frames the architectural goal as expensive text
  work once, then cheap resize-driven relayout.

It is not fully headless today:

- `../pretext/src/measurement.ts:36` creates a canvas context.
- `../pretext/src/measurement.ts:49` throws when neither OffscreenCanvas nor a
  DOM canvas exists.
- `../pretext/src/measurement.ts:61` calls `ctx.measureText(seg).width`.
- `../pretext/src/measurement.ts:74` computes browser-specific engine profile
  knobs from the user agent.

That means Slate must not promise cross-client or server-stable page breaks by
default. The right contract is profile-aware local layout, with an optional
authoritative page-break snapshot for strict collaboration and export.

## Pretext Drift Evidence

The current Pretext research log still treats browser parity as active,
profile-sensitive work:

- `../pretext/RESEARCH.md:55` records a `system-ui` canvas/DOM resolution
  mismatch on macOS.
- `../pretext/RESEARCH.md:131` records emoji canvas/DOM width discrepancies.
- `../pretext/RESEARCH.md:142` says the HarfBuzz headless probe was useful but
  not the runtime direction.
- `../pretext/RESEARCH.md:156` says final browser mismatches were handled by
  better `prepare()` preprocessing, diagnostics, and browser-specific
  tolerance, while `layout()` stayed arithmetic-only.

The external Pretext article points in the same direction. It argues that the
hot layout path can be portable and DOM-free, but calls out that initial
measurement depends on `canvas.measureText()` and that a headless/native
measurement layer matching browser font metrics is real work.

Slate implication:

- store a measurement profile alongside strict page-break snapshots.
- prefer named fonts for high-fidelity documents.
- treat `system-ui`, emoji, CJK/SEA scripts, and browser/font-version changes as
  profile-sensitive until proven otherwise.
- reject any API wording that implies same page breaks across macOS, Linux,
  Chrome, Safari, server, and export by default.

## Slate v2 Current Shape

Slate v2 already has enough layout substrate:

- `.tmp/slate-v2/packages/slate-layout/src/index.ts:105` defines box kinds for
  block, code line, image, table, table cell, and thematic break.
- `.tmp/slate-v2/packages/slate-layout/src/index.ts:113` defines split policy
  vocabulary: `avoid`, `line`, `page`, and `row`.
- `.tmp/slate-v2/packages/slate-layout/src/index.ts:236` defines snapshots with
  blocks, fragments, page, pages, root, settings, and version.
- `.tmp/slate-v2/packages/slate-layout/src/index.ts:277` defines an engine
  boundary.
- `.tmp/slate-v2/packages/slate-layout/src/index.ts:1349` implements the
  Pretext-backed page layout engine.
- `.tmp/slate-v2/packages/slate-layout/src/index.ts:1698` paginates measured
  blocks into fragments and pages.

The wrong part is the repeated unit used by paged rendering:

- `.tmp/slate-v2/packages/slate-layout/src/react.tsx:185` maps projected blocks
  into `getVirtualizedTopLevelItems`.
- `.tmp/slate-v2/packages/slate-layout/src/react.tsx:219` renders every page
  surface.
- `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:548`
  exposes only a top-level-item layout hook for virtualization.
- `.tmp/slate-v2/packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts:212`
  virtualizes top-level runtime ids, not pages/spreads.

Slate implication:

- keep block/top-level virtualization for continuous and pathological documents.
- when pagination is enabled, introduce a page/spread mount plan.
- retain active, selected, promoted, and composing pages outside the visible
  range.
- keep TanStack Virtual internal; public API should talk about layout/page view,
  not virtualizer item ranges.

## Tiptap Pagination Lessons

Tiptap Pages is negative evidence, not an architecture to copy.

The user-provided Medium summary flags paragraph splitting, tables, variable
font sizes, padding, and images. The local Tiptap docs validate the same class
of problems and expose why the CSS-float/page-gap trick is the wrong substrate
for Slate:

- `../tiptap-docs/src/content/pages/core-concepts/limitations.mdx:17` says
  Tiptap Pages positions elements around page gaps with CSS floats. Blocks that
  create a BFC, including tables, figures, or styled containers, cannot split
  across pages and break pagination when too large for one page.
- `../tiptap-docs/src/content/pages/core-concepts/limitations.mdx:18` suggests
  `max-height`/`--page-max-height` as a mitigation for large non-splittable
  blocks.
- `../tiptap-docs/src/content/pages/core-concepts/limitations.mdx:19` suggests
  manual node splitting, while warning that it changes document structure and
  may affect semantics.
- `../tiptap-docs/src/content/pages/guides/table-with-pages.mdx:16` says table
  pagination needs `@tiptap-pro/extension-pages-tablekit` because tables needed
  heavily modified behavior and layout to split across pages.
- `../tiptap-docs/src/content/pages/guides/table-with-pages.mdx:52` warns not to
  use the open-source TableKit with Pages because it is not compatible with the
  Pages layout, and `:63` warns extension authors can break the table splitting
  logic.

Slate implication:

- steal the failure taxonomy: BFC blocks, figures, styled containers, table
  rows, merged cells, nested tables, oversized media, page content rects, manual
  split semantics, export/import, and collab.
- reject Tiptap's CSS-float pagination mechanism.
- reject a product-specific raw Slate TableKit; raw `slate-layout` should define
  box provider and split-policy protocols.
- table/media plugins should provide row, span, intrinsic-size, and avoid/split
  behavior.
- tests need table rows, merged cells, nested tables, oversized images, page
  padding/content rects, mixed font metrics, and page-boundary editing.

## Premirror And TanStack Position

Premirror remains the closest shape to steal:

- snapshot -> measure -> compose -> render;
- fragments/pages are derived layout, not document nodes;
- page chrome sits outside document content;
- deterministic layout is a composer contract once measurement input is fixed.

TanStack Virtual remains a good internal range engine, not the editor contract:

- `docs/research/sources/editor-architecture/tanstack-virtual-and-github-large-surface-virtualization.md`
  keeps the prior decision to keep DOM coverage, selection, copy/paste, IME,
  mobile, browser-find, and a11y policy in Slate-owned code.

## Planning Decision

For the active Slate Plan:

- keep Pretext as the default layout engine.
- add measurement-profile vocabulary before any strict fidelity claim.
- make page-level virtualization the paged-mode repeated unit.
- keep block virtualization for continuous/pathological documents.
- add opt-in authoritative page-break snapshots for strict collaboration/export.
- treat Tiptap Pages as a failure taxonomy only; do not copy its CSS-float page
  layout model or specialized product table kit.
- require browser proof for page-boundary editing, tables/images, mixed fonts,
  clipboard, IME, a11y/missing DOM, and cross-profile drift before native parity
  claims.
