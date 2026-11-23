---
'platejs': patch
---

- Report an unsupported file type first when a file of another kind is picked for an upload placeholder, before the size and configuration checks.
- Fix an upload placeholder's submit sending its file twice, losing it or sending an older file when its transaction spec replays, another commit or a Cancel comes first, or a newer submit overtakes it.
