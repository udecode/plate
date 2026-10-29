---
'plitejs': major
---

Add `plitejs/pagination`. `measurePages` measures an editor into pages with `createPretextPageLayoutEngine` or `createEstimatedPageLayoutEngine`, and `pageSettingsCodec` persists page settings.

Add `PagedEditable`, `usePageLayout` and `usePageLayoutFragments` to `plitejs/pagination/react`, which render one editable on measured pages with page chrome, named roots and optional page virtualization. A measurement failure, such as a block with no fragmentation plan, reports to `lifecycleErrorSink` once until measurement succeeds or the failure changes.

In a `PagedEditable`, `renderText` runs once per piece of a text, with `piece: { index }` and `attributes` that hold no text identity or `ref`. Each measured run of the text on a drawn page is one piece, and one line can hold more than one run of the same text. The lines of a page not drawn yet form one piece, and a text that no layout measures is one piece.

Keep the headless root install independent from React. Install `@chenglou/pretext` when importing `plitejs/pagination` or `plitejs/pagination/react`.
