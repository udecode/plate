---
"@udecode/slate-plugins-core": major
---

Before, the handlers had to return `false` to prevent the next handlers to be called.
Now, we reuse `isEventHandled` internally used by `slate@0.65.0` which has the opposite behavior: a handler has to return `true` to stop the pipeline.
Additionally, the pipeline stops if at any moment `event.isDefaultPrevented()` or `event.isPropagationStopped()` returns `true`, except if the handler returns `false`.
See the updated docs in "Creating Plugins".
