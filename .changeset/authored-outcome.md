---
'plitejs': patch
---

Add `editor.read.authored.outcome(id)`, which says how a change id stands in the review, the same on every peer and after a reload. It returns `'pending'` while any of the change's marks is pending, and `'accepted'` or `'rejected'` from the verdict on the version of the change proposed last. It returns `'contested'` when that version holds both an accept and a reject, as two reviewers' tabs leave it once they sync. It returns `null` when the change left the review with no verdict: a decided table or row took it, an Editing removal deleted it, or its author withdrew it.

A decision writes no verdict for a change whose marks all sit on or inside a table or row that another change it decides takes whole, so Accept all over a struck table leaves a teammate's change inside it `null`, as accepting the table first does. The change whose strike takes the table keeps its verdict.
