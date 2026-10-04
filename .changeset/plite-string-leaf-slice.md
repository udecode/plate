---
'plitejs': patch
---

`editor.read.text.string` copies only the requested part of a text leaf, so reading a short range at the end of a long leaf no longer copies the whole leaf prefix.
