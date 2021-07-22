---
"@udecode/slate-plugins-common": patch
---

HTML deserializer with `'*'` style rule was inserting empty fields (e.g. color) on each paste. Fixed by not allowing empty styles to be deserialized.
