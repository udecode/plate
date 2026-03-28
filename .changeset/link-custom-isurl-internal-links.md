---
'@platejs/link': patch
---

- Fixed custom `isUrl` handling so it can reject internal paths like `/docs` and anchor links like `#top` instead of those shortcuts always being accepted.
