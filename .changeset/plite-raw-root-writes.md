---
'plitejs': patch
---

Remove a shared content root with its last owner when the schema sets `unknown: 'reject'`, so deleting the last block that shows it no longer throws. An open schema keeps the root.

Remove the content roots owned inside a removed root along with it, instead of throwing or leaving them behind when the update commits.

Return `false` from `tx.slice.replace` when the slice names a content root the schema would reject at that point, such as an exclusive root another block owns or a root the document lacks, instead of throwing when the update commits.
