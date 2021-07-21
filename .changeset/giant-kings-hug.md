---
"@udecode/slate-plugins-core": patch
---

Sometimes we want to preventDefault without stopping the handler pipeline, so we remove this check.
In summary, to stop the pipeline, a handler has to return `true` or run `event.stopPropagation()`
