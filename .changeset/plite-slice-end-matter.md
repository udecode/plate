---
'plitejs': patch
---

Add `slice: { endMatter: true }` to element schemas, for blocks that belong after the document's body, such as notes.

- A paste, `fragment.replace`, `slice.replace` or `tx.slice.replace` writes each end-matter element in the content after the last block of the target's root that is not an empty default block, in source order, but never above the block that receives the rest or above an empty block the root's schema requires there, and lands the rest at the target with the caret after it. A drop lands the element where it is dropped, and elements already in the document never move.
- A copy of words inside an end-matter element gives the words without the element, so they paste as words in any editor. A copy that covers the element whole, select-all included, keeps it.
- Declaring `endMatter` changes the schema fingerprint. A schema that declares none keeps its fingerprint.
