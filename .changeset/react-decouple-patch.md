---
'@platejs/core': patch
---

Moved `getNodeDataAttributeKeys` and `keyToDataAttribute` functions from static utilities to regular utilities to decouple React dependencies. This is an internal refactoring with no API changes - both functions remain accessible from the main `@platejs/core` export.