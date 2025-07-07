---
'@platejs/markdown': minor
---

Add support for [display text](mention:id) markdown format for mentions

- Enhanced `remarkMention` plugin to parse both `@username` and `[display text](mention:id)` formats
- Updated serialization to automatically use link format for mentions containing spaces
- Maintains backward compatibility with existing @username format
- Allows mentions with full names, spaces, and special characters