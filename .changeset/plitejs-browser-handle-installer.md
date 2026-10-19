---
'plitejs': patch
---

Add `installBrowserHandle()` to `plitejs/react`; `Editable` exposes the browser test handle and keeps the kernel trace only after it runs, so production bundles drop both. Read the handle under `BROWSER_HANDLE_KEY` from `plitejs/testing`

**Migration:** Call `installBrowserHandle()` once in the test or development entry that mounts editors for `@platejs/test`:

```ts
import { installBrowserHandle } from 'plitejs/react';

installBrowserHandle();
```
