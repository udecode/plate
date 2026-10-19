---
'plitejs': patch
---

Allow suggesting the deletion of a block that owns an exclusive content root. Deleting, replacing or pasting over such a block in Suggesting strikes it and keeps its content root until the change is decided, and accepting removes both. Previews, exports, decisions and loads drop each content root its last owner leaves behind.
