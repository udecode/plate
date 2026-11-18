---
'plitejs': patch
---

- Fix `read.authored.details` reading a deletion and an insertion apart, such as a moved paragraph's two copies, as one `replace` part. It now pairs them only when they touch.
