---
'platejs': patch
---

- Run a `useEditorSelector` selector again when its editor shows a different review preview, so hooks built on it, such as `useFieldRead`, show what the preview shows.
- Fix `renderStaticHtml` with a `document` option throwing while the editor shows a review preview.
