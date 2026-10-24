---
'plitejs': patch
---

Fix Editing deletes beside a pending join whose review marks, once everything was accepted, gave a different document than the editor showed:

- A delete that joins a line into a title, or into another line a root or container needs, lands the line there instead of in the deleted line kept as the required line. The same delete made while Suggesting now records, where before it left the document unchanged.
- A delete that joins into a line holding another author's pending suggestion stays pending until that suggestion is decided, so either decision keeps the joined text.
