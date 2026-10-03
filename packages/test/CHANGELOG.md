# @platejs/test

## 54.0.0-beta.1

### Major Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Use Plite `Range` and `Selection` types for browser kernel commands and traces; remove `PliteBrowserKernelRange`.

  **Migration:** Import the canonical model types from `platejs`:

  ```ts
  import type { Range, Selection } from "platejs";
  ```

### Patch Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require `platejs@>=54.0.0-beta.1` as a peer dependency.

  Add fail-closed direct-Appium Android and iOS receipt validation with an exact scenario matrix, source-commit matching, and independent artifact readback.

  Expose trusted typing timing and long-task capture for real editor routes.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Ignore rendering-only trailing newlines in browser block-text assertions

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Capture console-reported DOM-node resolution failures in browser runtime-error checks, alongside DOM-point and DOM-range failures.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Add the `@platejs/test` distribution with a Node-safe fixture root and explicit React, DOM, Playwright, and proof entrypoints. The proof surfaces include typed editor harnesses, replay and reduction helpers, DOM and selection assertions, native traces, screenshots, and raw-mobile receipt validation.

  **Migration:** Replace `@platejs/test-utils` with `@platejs/test`. Replace `@platejs/playwright` with `@platejs/test/playwright`; React test helpers use `@platejs/test/react`.

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Paste through each Playwright project's `use.clipboardTransport` (`'native'`, `'event'` or `'handle'`) and fail when the paste changed no document content or the page threw; `ready` fails with "browser handle not installed" when the app never called `installBrowserHandle()`

  **Migration:** Type the config with `BrowserTestOptions` and set a transport on every project that pastes:

  ```ts
  import type { BrowserTestOptions } from "@platejs/test/playwright";

  export default defineConfig<BrowserTestOptions>({
    projects: [
      {
        name: "chromium",
        use: { ...devices["Desktop Chrome"], clipboardTransport: "native" },
      },
    ],
  });
  ```

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Add `isTrusted`, `key`, `keyCode`, `clientX`, `clientY` and a monotonic `seq` to native event trace entries, and opt-in `'keydown'` and `'pointerdown'` trace types
