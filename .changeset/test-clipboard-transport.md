---
'@platejs/test': patch
---

Paste through each Playwright project's `use.clipboardTransport` (`'native'`, `'event'` or `'handle'`) and fail when the paste changed no document content or the page threw; `ready` fails with "browser handle not installed" when the app never called `installBrowserHandle()`

**Migration:** Type the config with `BrowserTestOptions` and set a transport on every project that pastes:

```ts
import type { BrowserTestOptions } from '@platejs/test/playwright';

export default defineConfig<BrowserTestOptions>({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], clipboardTransport: 'native' } },
  ],
});
```
