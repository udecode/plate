---
'plitejs': patch
---

Open closed content, such as a closed details, when a block drag rests on its block for 800 ms, so the drop can land inside. The content's `onMaterialize` callback runs with the new `drag` reason; ignore that reason to keep the content closed during a drag.
