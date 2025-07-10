---
'@platejs/markdown': patch
---

Add support for [display text](mention:id) markdown format for mentions

- Updated `remarkMention` plugin to only support the `[display text](mention:id)` format
- Dropped support for legacy `@username` format
- Mentions now require an explicit display text and ID structure
- Enables full names, spaces, and special characters in mention display text
