---
'plitejs': patch
---

- Fix a teammate's letter being lost when a Yjs peer, in one commit, wraps a paragraph twice, or changes one of its properties other than its type and wraps it. The peer now writes the wraps and the property change without rewriting the paragraph's letters, so concurrent typing in it survives.
- Fix a teammate's removal from a set-valued property being lost after a Yjs peer wraps its element. When a property merges as a set only under some parents, the moved element kept the storage of its old parent. The peer now stores the property the way the new parent asks and keeps the element's letters. A property the teammate sets at the same moment as the wrap still keeps its old storage, and a text mark that merges as a set only under some parents still makes the peer rewrite the line.
