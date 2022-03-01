---
'@udecode/plate-headless': patch
---

Add @udecode/plate-combobox to @udecode/plate-headless dependencies.

Plate combobox was getting compiled into the dist files, as opposed to being just re-exported, leading to two conflicting versions of @udecode/plate-combobox: one being the package itself, the other being the inlined version in @udecode/plate-headless.

Fixes: #1339
