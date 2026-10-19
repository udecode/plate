---
'plitejs': patch
---

Add `editor.api.transfer` with `move` and `copy`, plus `editor.read.transfer.nodes`. A block lands wherever the target's schema accepts it, at any depth. A move inside one document lands its whole content or nothing in one undo step, a copy between editors follows paste, and `to: 'next' | 'previous'` steps blocks past a sibling inside their parent. Plugins redirect a landing edge through `editorReads.transfer.landing` and refuse landings with `transferVeto`.
