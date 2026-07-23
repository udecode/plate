---
"@platejs/browser": patch
---

Add `@platejs/browser/core`, `@platejs/browser/browser`, and
`@platejs/browser/playwright` proof surfaces with typed editor harnesses,
canonical serializable scenarios, replay and reduction helpers, DOM and
selection assertions, and an explicit `harness.scenario.runImperative` escape
hatch for non-replayable setup. Versioned replay decoding validates exact
step, assertion, and kernel-trace contracts, rejects no-op or lossy payloads,
and fails closed on unknown imported steps.
Replay decoders, scenario builders, native trace limits, and release artifacts
reject invalid discrete numeric domains and reversed ranges.

**Migration:** Remove `@platejs/playwright` and its React adapter helpers. Use
`openExample` or `createPliteBrowserEditorHarness` from
`@platejs/browser/playwright`.
