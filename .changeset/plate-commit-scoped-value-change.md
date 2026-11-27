---
'platejs': patch
---

Fix `EditorRoot` `onValueChange` to emit commit-scoped `EditorDocumentValue` without replaying commits across React `Activity` reconnects or forcing lazy state codecs on ephemeral writes, export `UseStateFieldValueOptions` from `platejs/react`, and default selector option generics to `unknown`
