---
'@platejs/core': major
'@platejs/media': patch
'@platejs/ai': patch
'www': patch
---

Decouple React from @platejs/core

**Breaking Changes:**
- `createZustandStore` is no longer exported from `@platejs/core`. Import it from `@platejs/core/react` or `platejs/react` instead.

**Migration:**
```diff
- import { createZustandStore } from '@platejs/core';
+ import { createZustandStore } from '@platejs/core/react';
// or
+ import { createZustandStore } from 'platejs/react';
```

**Details:**
- The core package now exports `createVanillaStore` for non-React usage
- React-specific functionality is moved to a separate export path: `@platejs/core/react`
- Added `optionsStoreFactory` parameter to allow React version to provide its own store factory