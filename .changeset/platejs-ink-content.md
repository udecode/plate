---
'platejs': patch
---

Replace `InkLayer` with `InkContent`, which mounts as the ink plugin's `wrapContent` slot. In development, it throws when anything sits between the Editable and the ink layer, such as a toolbar the layer would cover.

**Migration:** Replace the `wrapContent` slot that rendered `<InkLayer sign={Sign} />` after its children with `wrapContent: (props) => <InkContent {...props} sign={Sign} />`.
