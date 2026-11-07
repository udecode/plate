---
'plitejs': patch
---

- Fix an annotation change listener that unsubscribes and resubscribes itself during a change, which ran again in the same pass until the page hung
- Skip an annotation change listener that another listener removes during a change
