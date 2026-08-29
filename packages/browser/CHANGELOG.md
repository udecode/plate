# @platejs/browser

## 54.0.0-beta.2

### Major Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Use Plite `Range` and `Selection` types for browser kernel commands and traces; remove `PliteBrowserKernelRange`.

  **Migration:** Import the canonical model types from `@platejs/plite`:

  ```ts
  import type { Range, Selection } from "@platejs/plite";
  ```

### Minor Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Add fail-closed direct-Appium Android and iOS receipt validation with an exact scenario matrix, source-commit matching, and independent artifact readback.

  Expose trusted typing timing and long-task capture for real editor routes.

### Patch Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Add `@platejs/browser/core`, `@platejs/browser/browser`, and `@platejs/browser/playwright` proof surfaces with typed editor harnesses, canonical serializable scenarios, replay and reduction helpers, DOM and selection assertions, and an explicit `harness.scenario.runImperative` escape hatch for non-replayable setup. Versioned replay decoding validates exact step, assertion, and kernel-trace contracts, rejects no-op or lossy payloads, and fails closed on unknown imported steps. Replay decoders, scenario builders, native trace limits, and release artifacts reject invalid discrete numeric domains and reversed ranges.

  **Migration:** Remove `@platejs/playwright` and its React adapter helpers. Use `openExample` or `createPliteBrowserEditorHarness` from `@platejs/browser/playwright`.
