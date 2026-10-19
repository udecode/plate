---
'@platejs/test': major
---

Use Plite `Range` and `Selection` types for browser kernel commands and traces; remove `PliteBrowserKernelRange`.

**Migration:** Import the canonical model types from `platejs`:

```ts
import type { Range, Selection } from 'platejs';
```
