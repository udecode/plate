---
'plitejs': patch
---

- Pass every `Editable` DOM handler an `EditableHandlerContext` after its event, whose `editor` is the view that runs the handler
- Run an `Editable`'s DOM handlers for an event inside one of its content roots, once, with the content root's view as `context.editor`
