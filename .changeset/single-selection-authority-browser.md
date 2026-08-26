---
'@platejs/browser': major
---

Use Plite `Range` and `Selection` types for browser kernel commands and traces; remove `PliteBrowserKernelRange`.

**Migration:** Import the canonical model types from `@platejs/plite`:

```ts
import type { Range, Selection } from '@platejs/plite';
```
