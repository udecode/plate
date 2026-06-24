---
"slate-browser": minor
---

Add the public Slate browser proof harness.

Use `slate-browser/playwright` for editor behavior tests, `slate-browser/core` for pure proof contracts and release-proof artifacts, `slate-browser/browser` for DOM selection snapshots, and `slate-browser/transports` for device/browser proof-scope descriptors. The package is test infrastructure, not runtime editor API, and its root module is intentionally unavailable.

Each public subpath ships typed ESM export conditions for consumer import and declaration resolution.
