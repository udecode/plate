---
'plitejs': major
---

Add `plitejs/pagination`. `measurePages` measures an editor into pages with `createPretextPageLayoutEngine` or `createEstimatedPageLayoutEngine`, and `pageSettingsCodec` persists page settings.

Add `PagedEditable`, `usePageLayout` and `usePageLayoutFragments` to `plitejs/pagination/react`, which render one editable on measured pages with page chrome, named roots and optional page virtualization. A measurement failure, such as a block with no fragmentation plan, reports to `lifecycleErrorSink` once until measurement succeeds or the failure changes.

In a `PagedEditable`, `renderText` runs once per piece of a text, with `piece: { index }` and `attributes` that hold no text identity or `ref`. Each measured run of the text on a drawn page is one piece, and one line can hold more than one run of the same text. The lines of a page not drawn yet form one piece, and a text that no layout measures is one piece.

An editable `PagedEditable` renders an empty, non-editable `span` with `data-editor-render-only="soft-line-end"` after each measured line that wraps, outside `renderText`, so Shift+Down and Shift+Up inside a paragraph move one measured line per press. Copied content leaves it out.

In a `PagedEditable`, the paragraph you edit keeps the lines the layout measured, in browsers that support `text-wrap-mode`. Text that your styles paint wider than the `typography` option's font and letter spacing runs past the line's right edge instead of wrapping over the next block. An inline void whose text is empty, such as a mention, takes no width in the measure, so a line that holds one can run past the right edge by the void's painted width. An editor nested in a paged block keeps its own wrapping when its root sets `white-space`, as `Editable` does unless `disableDefaultStyles` is set. So in a `PagedEditable` nested in another's paged block, an inline element with its own wrapping style, such as inline code, can still wrap.

In Firefox, ArrowUp and ArrowDown in a `PagedEditable`, with or without Shift, move from a paragraph's first or last line onto the nearest line of the paragraph above or below, across pages too, as in Chromium and WebKit. In Firefox, a press toward a table can skip past it.

Keep the headless root install independent from React. Install `@chenglou/pretext` when importing `plitejs/pagination` or `plitejs/pagination/react`.
