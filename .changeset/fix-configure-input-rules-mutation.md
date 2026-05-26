---
"@platejs/core": patch
---

Fix `.configure({ inputRules })` losing rules on subsequent editor instances

The user's config object was shared across resolutions via closure; clearing `inputRules` on the first resolve left later editors (StrictMode remounts, HMR, multi-editor pages) with no configured rules.
