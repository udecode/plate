---
'@udecode/plate-core': patch
---

- `createPlateEditor`/`usePlateEditor`
  - new `components` option, alias to `override.components`
  - new `skipInitialization` option, skip the initialization logic (`editor.children`, `editor.selection`, normalizing the initial value)
- New api `editor.api.shouldNormalizeNode`: use case is to prevent normalizeNode from being called when the editor is not ready
- New transform `editor.tf.init`: initialize `editor.children`, `editor.selection`, normalizing the initial value. Use it when `skipInitialization` is `true`.
