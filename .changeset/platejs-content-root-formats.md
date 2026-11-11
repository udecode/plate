---
'platejs': patch
---

- Read and write an element's content roots in HTML and Markdown node mappings through `contentRoot(slot)`, and decode them through HTML `decode`'s `contentRoots`. HTML `parseSlice` carries those roots in the slice
- Skip a foreign HTML mapping whose target plugin is missing or disabled instead of throwing
- Export `nodeWriteVeto` from `platejs`
- Refuse a comment in a named root, such as a board note: `begin` returns `false`, `createDraft` returns `null` and `createThread` resolves `invalid`
