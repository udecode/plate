---
"@platejs/utils": major
---

- Base Plate node types on Plite `Element` and `Text`
- Represent `TCaptionElement` with an element-owned `childRoots.caption` key
  instead of an embedded descendant array
- Rename `TNodeMap` to `NodeMap`
- Export `SingleBlockKit` and `SingleLineKit` as complete readonly plugin arrays

**Migration:** Replace `TNodeMap` imports with `NodeMap`, import editor node
primitives from `@platejs/plite`, and replace `TCaptionElement.caption` with
`TCaptionElement.childRoots.caption` plus the matching
`EditorDocumentValue.roots` entry.
