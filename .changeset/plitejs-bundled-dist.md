---
'plitejs': patch
---

Fix Next.js production builds with Turbopack's default scope hoisting, where a page with an editor failed to prerender with `Editor read registrations must be created by the plugin read factory`. Apps no longer need `experimental.turbopackScopeHoisting: false`.
