---
'plitejs': patch
---

Fix rejecting a suggested line break that dropped another author's pending format on the emptied line, such as an alignment or a heading. The format now stays pending on the line that remains, and accepting or rejecting it works as before.
