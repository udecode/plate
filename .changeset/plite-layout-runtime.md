---
'plitejs': major
---

Add `plitejs/pagination`. `measurePages` measures an editor into pages with `createPretextPageLayoutEngine` or `createEstimatedPageLayoutEngine`, and `pageSettingsCodec` persists page settings.

Add `PagedEditable`, `usePageLayout` and `usePageLayoutFragments` to `plitejs/pagination/react`, which render one editable on measured pages with page chrome, named roots and optional page virtualization.

Keep the headless root install independent from React. Install `@chenglou/pretext` when importing `plitejs/pagination` or `plitejs/pagination/react`.
