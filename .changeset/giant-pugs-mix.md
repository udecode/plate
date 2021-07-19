---
"@udecode/plate-core": patch
---

fix: before, store setValue was called at the start of `onChange` pipeline. Now, it's called at the end of the pipeline so we can make use of this value as the "previous value" in plugins `onChange`.
