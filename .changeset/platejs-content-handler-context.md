---
'platejs': patch
---

- Pass `PlateContent`'s DOM handler props an `EditableHandlerContext` after their event, whose `editor` is the view that runs the handler, such as a content root's
