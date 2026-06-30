---
"@platejs/link": patch
---

Fix Floating Link: ignore the Safari + Japanese IME composition-commit Enter (`keyCode === 229`, where `isComposing` is false) so it no longer submits the link mid-composition. Mirrors the Enter guard already used in `cmdk`.
