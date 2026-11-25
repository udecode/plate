---
'plitejs': patch
---

Fix the sync room refusing a suggester's undo of their own withdrawal when the undo puts back another author's pending change. The room now takes back the writer's own entry at suggest access too, as long as the access the writer holds now still covers that entry, so a writer whose access was lowered cannot undo what only the old access let them write.
