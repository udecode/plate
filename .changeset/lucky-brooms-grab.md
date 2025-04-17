---
'@udecode/plate-core': patch
---

- `createPlateEditor`/`usePlateEditor` now have `components` option, alias to `override.components`
- New method `editor.api.shouldNormalizeNode`: use case is to prevent normalizeNode from being called when the editor is not ready
