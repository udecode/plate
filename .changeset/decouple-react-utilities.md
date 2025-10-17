---
"@platejs/core": patch
---

Refactor: Move `getNodeDataAttributeKeys` and `keyToDataAttribute` utilities from static exports to regular utils to decouple React dependencies.

**Breaking Change**: These functions are no longer exported from `@platejs/core/static`. Import them from `@platejs/core` instead:

```diff
- import { getNodeDataAttributeKeys, keyToDataAttribute } from '@platejs/core/static';
+ import { getNodeDataAttributeKeys, keyToDataAttribute } from '@platejs/core';
```